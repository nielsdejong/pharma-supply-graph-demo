/* eslint-disable no-confusing-arrow */
import { useEffect, useRef, useState } from 'react';
import { Button, Widget, Typography, Avatar, TextInput } from '@neo4j-ndl/react';

import ChatBotUserAvatar from '../assets/chatbot-user.png';
import ChatBotAvatar from '../assets/chatbot-ai.png';

type ChatbotProps = {
  messages: {
    id: number;
    user: string;
    message: string;
    datetime: string;
    isTyping?: boolean;
  }[];
};

export default function Chatbot(props: ChatbotProps) {
  const { messages } = props;
  const [listMessages, setListMessages] = useState(messages);
  const [inputMessage, setInputMessage] = useState('');
  const formattedTextStyle = { color: 'rgb(var(--theme-palette-discovery-bg-strong))' };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const simulateTypingEffect = (responseText: string, index = 0) => {
    if (index < responseText.length) {
      const nextIndex = index + 1;
      const currentTypedText = responseText.substring(0, nextIndex);

      if (index === 0) {
        const date = new Date();
        const datetime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        setListMessages((msgs) => [
          ...msgs,
          { id: Date.now(), user: 'chatbot', message: currentTypedText, datetime: datetime, isTyping: true },
        ]);
      } else {
        setListMessages((msgs) => msgs.map((msg) => (msg.isTyping ? { ...msg, message: currentTypedText } : msg)));
      }

      setTimeout(() => simulateTypingEffect(responseText, nextIndex), 20);
    } else {
      setListMessages((msgs) => msgs.map((msg) => (msg.isTyping ? { ...msg, isTyping: false } : msg)));
    }
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!inputMessage.trim()) {
      return;
    }
    const date = new Date();
    const datetime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const userMessage = { id: 999, user: 'user', message: inputMessage, datetime: datetime };
    setListMessages((listMessages) => [...listMessages, userMessage]);
    setInputMessage('');

    const chatbotReply = 'Hello Sir, how can I help you today?'; // Replace with getting a response from your chatbot through your APIs
    simulateTypingEffect(chatbotReply);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [listMessages]);

  return (
    <div className='n-bg-palette-neutral-bg-default flex flex-col justify-between min-h-screen max-h-full overflow-hidden'>
      <div className='flex overflow-y-auto pb-12 min-w-full'>
        <Widget className='n-bg-palette-neutral-bg-default w-full h-full' header='' isElevated={false}>
          <div className='flex flex-col gap-3 p-3'>
            {listMessages.map((chat) => (
              <div
                ref={messagesEndRef}
                key={chat.id}
                className={`flex gap-2.5 items-end ${chat.user === 'chatbot' ? 'flex-row' : 'flex-row-reverse'} `}
              >
                <div className='w-8 h-8'>
                  {chat.user === 'chatbot' ? (
                    <Avatar
                      className='-ml-4'
                      hasStatus
                      name='KM'
                      shape='square'
                      size='x-large'
                      source={ChatBotAvatar}
                      status='online'
                      type='image'
                    />
                  ) : (
                    <Avatar
                      className=''
                      hasStatus
                      name='KM'
                      shape='square'
                      size='x-large'
                      source={ChatBotUserAvatar}
                      status='online'
                      type='image'
                    />
                  )}
                </div>
                <Widget
                  header=''
                  isElevated={true}
                  className={`p-4 self-start max-w-[55%] ${
                    chat.user === 'chatbot' ? 'n-bg-palette-neutral-bg-weak' : 'n-bg-palette-primary-bg-weak'
                  }`}
                >
                  <div>
                    {chat.message.split(/`(.+?)`/).map((part, index) =>
                      index % 2 === 1 ? (
                        <span key={index} style={formattedTextStyle}>
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </div>
                  <div className='text-right align-bottom pt-3'>
                    <Typography variant='body-small'>{chat.datetime}</Typography>
                  </div>
                </Widget>
              </div>
            ))}
          </div>
        </Widget>
      </div>
      <div className='n-bg-palette-neutral-bg-default flex gap-2.5 bottom-0 p-2.5 w-full'>
        <form onSubmit={handleSubmit} className='flex gap-2.5 w-full'>
          <TextInput
            className='n-bg-palette-neutral-bg-default flex-grow-7 w-full'
            type='text'
            value={inputMessage}
            fluid
            onChange={handleInputChange}
          />
          <Button type='submit'>Submit</Button>
        </form>
      </div>
    </div>
  );
}
