import React, { useEffect, useState } from 'react';
import {io} from 'socket.io-client'
import ListaDeJogadores from './ListaDeJogadores';
import Chat from './Chat';
import ListaDeSalas from './ListaDeSalas';
import Modal from './Modal';
import PingPong from './PingPong';

const socket = io('http://localhost:4000');

//Criando o componente Pong de Jogo
const Client = () => {
    const [jogadores, setJogadores] = useState({});
    const [salas, setSalas] = useState({});
    const [mensagens, setMensagens] = useState('');
    const [janelaDeJogo, setJanelaDeJogo] = useState(false);
    const [comandoDoJogador1, setComandoDoJogador1] = useState(''); 
    const [comandoDoJogador2, setComandoDoJogador2] = useState('');

    //Método responsável por sinalizar ao cliente que ele foi conectado.
    useEffect(() => {
        socket.on('connect', () => {console.log('Conectado!');});
    }, [/* Dependencias (arquivos necessários para a execução do procedimento)*/]);

    //Método responsável por receber a atualização de clientes do servidor
    useEffect(() => {
        socket.on('atualizarClientes', (jogadores) => {setJogadores(jogadores)});
    }, [jogadores]);

    //Método responsável por receber do servidor a atualização da caixa de mensagens de todos os clientes
    useEffect(() => {
        socket.on('receberMensagem', (mensagemRecebida) => {
            setMensagens(mensagens + mensagemRecebida + '\n')});
    }, [mensagens]);

    //Método responsável por enviar do servidor a atualização de salas de jogo à todos os clientes
    useEffect(() => {
        socket.on('atualizarSalas', (salas) => {setSalas(salas)});
    }, [salas]);

    //Método responsável por enviar do servidor a abertura de janela de jogo
    useEffect(() => {
        socket.on('iniciarJogo', () => {setJanelaDeJogo(true)})
        socket.on('fecharJogo', () => {setJanelaDeJogo(false)})
    }, [janelaDeJogo]);

    useEffect(() => {
        if(janelaDeJogo){
            window.addEventListener('keydown', (event) => {
                socket.emit('emitirMovimento',event.key);
            })
            socket.on('controlarJogador', (controle) => {
                if(controle[0] === 1)
                    setComandoDoJogador1(controle[1]);
                if(controle[0] === 2)
                    setComandoDoJogador2(controle[1]);
            });
        }
    }, [janelaDeJogo]);

    const enviarMensagem = (mensagem) => {
        //Envia a mensagem à todos somente se ela não for inválida
        if(!(!mensagem || /^\s*$/.test(mensagem)))
            socket.emit('enviarMensagem', mensagem);
    }

    const interagirSala = (sala) => {
        if(sala === "")
            socket.emit('criarSala');
        else if(sala === "+")
            socket.emit('atualizarListaDeSalas');
        else
            socket.emit('acessarSala', sala);
    }

    const sairDaSala = (sala) => {
        socket.emit('sairDaSala',sala);
    }

    const iniciarJogo = () => {
        socket.emit('iniciarJanelaDeJogo');
    }

    const sairDoJogo = () => {
        socket.emit('sairDoJogo');
    }

    return (
        //Criando uma tabela da lista de jogadores, lista de salas e um chat
        <div>
            <ListaDeJogadores
                jogadores={jogadores}
            />
            <ListaDeSalas
                iniciarJogo={iniciarJogo}
                interagirSala={interagirSala}
                sairDaSala={sairDaSala}
                salas={salas}
                socketAtual={socket.id}
            />
            <Chat
                enviarMensagem={enviarMensagem}
                mensagens={mensagens}
            />
            <Modal
                key="modal"
                show={janelaDeJogo}
                onClose={() => sairDoJogo()}
                title="Ping Pong"
            >
                <PingPong
                    comandoDoJogador1={comandoDoJogador1}
                    comandoDoJogador2={comandoDoJogador2}
                    finalizarJogo={janelaDeJogo}
                />
            </Modal>
        </div>
    );
};

export default Client;
