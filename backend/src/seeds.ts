require('dotenv').config();
import { faker } from '@faker-js/faker';
import { createCanvas } from 'canvas';
import axios, { AxiosError } from 'axios';
import { config } from './config';

const avatarColor = (): string => {
  const colors = [
    '#FFFFFF', // White
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#808080', // Gray
    '#FFA500' // Orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const generateAvatar = (text: string, backgroundColor: string, foregroundColor = 'white') => {
  const canvas = createCanvas(200, 200);
  const context = canvas.getContext('2d');
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = 'normal 80p sans-serif';
  context.fillStyle = foregroundColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL('image/png');
};

const seedUserData = async (count: number): Promise<void> => {
  try {
    for (let i = 0; i < count; i++) {
      const username: string = faker.internet.userName();
      const color = avatarColor();
      const avatar = generateAvatar(username.charAt(0).toUpperCase(), color);

      const body = {
        username,
        password: 'quan0401',
        email: faker.internet.email(),
        avatarColor: color,
        avatarImage: avatar
      };
      console.log(`***ADDING USER TO DATABASE*** - ${i + 1} of ${count} - ${username}`);
      await axios.post(config.API_URL + '/signup', body);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;
      console.log(err.response?.data, err.message);
    } else {
      const err = error as Error;
      console.log(err);
    }
  }
};
seedUserData(10);
