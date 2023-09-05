import { IUserDocument } from '~user/interfaces/user.interface';

export const userMock: IUserDocument = {
  _id: '64ca3a1d4e12ac4b6c7f766c',
  profilePicture: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg',
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  blocked: [],
  blockedBy: [],
  notifications: {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  work: '',
  school: '',
  location: '',
  quote: '',
  bgImageVersion: '',
  bgImageId: '',
  username: 'Quan0401',
  uId: '149044456846',
  email: 'dongminhquan2004@gmail.com',
  avatarColor: 'red',
  createdAt: new Date('2023-08-02T11:12:29.743Z'),
  authId: '64ca3a1d4e12ac4b6c7f766b'
} as unknown as IUserDocument;

export const userMock2: IUserDocument = {
  _id: '64ca3a1d4e12ac4b6c7f766d',
  profilePicture: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg',
  postsCount: 10,
  followersCount: 100,
  followingCount: 50,
  blocked: [],
  blockedBy: [],
  notifications: {
    messages: true,
    reactions: false,
    comments: true,
    follows: true
  },
  social: {
    facebook: 'https://www.facebook.com/user2',
    instagram: 'https://www.instagram.com/user2',
    twitter: 'https://twitter.com/user2',
    youtube: ''
  },
  work: 'Software Engineer',
  school: 'University of XYZ',
  location: 'New York, USA',
  quote: 'Carpe Diem',
  bgImageVersion: '2.0',
  bgImageId: '64ca3a1d4e12ac4b6c7f766e',
  username: 'User2',
  uId: '5432109876',
  email: 'user2@example.com',
  avatarColor: 'blue',
  createdAt: new Date('2023-08-05T14:20:00.000Z'),
  authId: '64ca3a1d4e12ac4b6c7f766d'
} as unknown as IUserDocument;
