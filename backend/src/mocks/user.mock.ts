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
