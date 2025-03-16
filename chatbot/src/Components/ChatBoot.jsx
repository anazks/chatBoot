import React, { useState, useEffect } from 'react';
import './chatboot.css';
import Axios from '../axios/Axios';

function ChatBoot() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! What is your name?', avatar: '' },
  ]);
  const [botAvatar, setBotAvatar] = useState('/bot-avatar.png'); // Default placeholder avatar
  const [newMessage, setNewMessage] = useState('');
  const [aiNewMessage, setAiNewMessage] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [anythingButton, setAnythingButton] = useState(false);
  const [genartedAnswer, setGenartedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false); // To show typing animation

  // Fetch the bot avatar
  useEffect(() => {
    const fetchBotAvatar = async () => {
      try {
        const response = await Axios.get('/get-avatar');
        if (response.data?.imageUrl) {
          setBotAvatar(response.data.imageUrl);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.sender === 'bot' ? { ...msg, avatar: response.data.imageUrl } : msg
            )
          );
        }
      } catch (error) {
        console.error('Error fetching bot avatar:', error);
      }
    };

    fetchBotAvatar();
  }, []);

  // Fetch categories when a name is set
  useEffect(() => {
    if (!name) return;

    const fetchCategories = async () => {
      try {
        setIsTyping(true); // Show typing animation
        const response = await Axios.get('/get-allCategory');
        if (response.data && Array.isArray(response.data)) {
          console.log(response.data)
          setCategories(response.data);
        }
        setIsTyping(false); // Hide typing animation
      } catch (error) {
        setIsTyping(false);
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [name]);

  const handleSendMessageAI = async () => {
    if (!aiNewMessage.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: prevMessages.length + 1,
        sender: 'user',
        text: aiNewMessage,
        avatar:
          'https://www.pngarts.com/files/5/User-Avatar-PNG-Transparent-Image.png',
      },
    ]);

    setIsTyping(true); // Show typing animation

    try {
      const response = await Axios.post('/get-webisteQueston', { question: aiNewMessage });
      setGenartedAnswer(response.data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 2,
          sender: 'bot',
          text: response.data.answer,
          avatar: botAvatar,
        },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 2,
          sender: 'bot',
          text: 'Sorry, I couldn’t process your question.',
          avatar: botAvatar,
        },
      ]);
    } finally {
      setIsTyping(false); // Hide typing animation
    }

    setAiNewMessage('');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: prevMessages.length + 1,
        sender: 'user',
        text: newMessage,
        avatar:
          'https://www.pngarts.com/files/5/User-Avatar-PNG-Transparent-Image.png',
      },
    ]);

    if (!name) {
      setName(newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 2,
          sender: 'bot',
          text: `Nice to meet you, ${newMessage}! Let me show you some categories.`,
          avatar: botAvatar,
        },
      ]);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 2,
          sender: 'bot',
          text: `Hey, ${name}! You can select a category below to see the questions.`,
          avatar: botAvatar,
        },
      ]);
    }

    setNewMessage('');
  };

  const handleCategoryClick = async (category) => {
    try {
      setIsTyping(true); // Show typing animation
      const response = await Axios.get(`/get-categoryBasedQuestion/${category.name}`);
      setQuestions(response.data);
      setIsTyping(false); // Hide typing animation
    } catch (error) {
      setIsTyping(false);
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswer = (question) => {
    setAnswer(question.answer);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: prevMessages.length + 1,
        sender: 'bot',
        text: question.answer,
        avatar: botAvatar,
      },
    ]);
  };

  const toggleAnythingButton = () => {
    setAnythingButton(!anythingButton);
  };

  return (
    <div className="chat-container">
      <button className="anything" onClick={toggleAnythingButton}>
        Ask Anything
      </button>
      <div className="chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <img src={msg.avatar} alt={`${msg.sender}-avatar`} className="avatar" />
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message bot">
            <img src={botAvatar} alt="bot-avatar" className="avatar" />
            <div className="message-text">Typing...</div>
          </div>
        )}
        <div className="chat-category">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="category-button"
            >
              {category.name}
              {category.Subname ? <>
                <button style={{color:"black",border:'1px solid black'}}>
                  {category.Subname}
                </button>
              </> : ""}
            </button>
          ))}
        </div>

        <div className="chat-questions">
          {questions.map((question) => (
            <button
              key={question.id}
              onClick={() => handleAnswer(question)}
              className="category-button"
            >
              {question.question} ?
            </button>
          ))}
        </div>

        {answer && (
          <div className="answers">
            <div className="answer">
              <img src={botAvatar} className="avatar" alt="bot-avatar" />
              <div className="question">{answer}</div>
            </div>
          </div>
        )}

        {genartedAnswer && (
          <div className="answers">
            <div className="answer">
              <img src={botAvatar} className="avatar" alt="bot-avatar" />
              <div className="question">{genartedAnswer}</div>
            </div>
          </div>
        )}
      </div>

      {anythingButton ? (
        <div className="chat-input-new">
          <input
            type="text"
            placeholder="Ask any question about the college..."
            value={aiNewMessage}
            onChange={(e) => setAiNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessageAI}>Send</button>
        </div>
      ) : (
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default ChatBoot;
