import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
    Button
} from '@chatscope/chat-ui-kit-react';



const API_KEY = process.env.REACT_APP_API;

const systemMessage = {
    "role": "system", "content": "Je suis un dietiticient virtuel, je peux vous aider à trouver des recettes, " +
        "des conseils nutritionnels et des informations sur les aliments. il faut me demander mes mensuration afin de " +
        "me faire un programme spécifique.pour cela de doit me demander de remplir le formulaire a droite de l ecran"
}

function App() {

    //initiation du premier message
    const [messages, setMessages] = useState([
        {
            message: "Bonjour, je suis votre coach nutrition comment puis-je vous aider!",
            sentTime: "just now",
            sender: "ChatGPT"
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (message) => {
        const newMessage = {
            message,
            direction: 'outgoing',
            sender: "user"
        };
        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
    };

    async function processMessageToChatGPT(chatMessages) {

        let apiMessages = chatMessages.map((messageObject) => {
            let role = "";
            if (messageObject.sender === "ChatGPT") {
                role = "assistant";
            } else {
                role = "user";
            }
            return { role: role, content: messageObject.message}
        });

        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": [
                systemMessage,
                ...apiMessages
            ]
        }

        await fetch("https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(apiRequestBody)
            }).then((data) => {
            return data.json();
        }).then((data) => {
            console.log(data);
            setMessages([...chatMessages, {
                message: data.choices[0].message.content,
                sender: "ChatGPT"
            }]);
            setIsTyping(false);
        });
    }
    const clearChat = () => {
        setMessages([messages[0]]);
    }
    return (
        <div className="App-header">
            <div style={{ position:"relative", height: "700px", width: "700px"  }}>
                <MainContainer>
                    <ChatContainer>
                        <MessageList
                            scrollBehavior="smooth"
                            typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
                        >
                            {messages.map((message, i) => {
                                console.log(message)
                                return <Message key={i} model={message} />
                            })}
                        </MessageList>
                        <MessageInput placeholder="Type message here" onSend={handleSend} />

                    </ChatContainer>
                </MainContainer>
                <Button onClick={clearChat}>Clear Chat</Button>
            </div>
        </div>
    )
}

export default App
