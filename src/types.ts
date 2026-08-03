export type Size = 'PP' | 'P' | 'M' | 'G' | 'GG';

export type UserRole = 'MESTRE' | 'ADM' | 'LIDER' | 'FUNCIONARIO_A' | 'FUNCIONARIO_B';

export interface UserProfileClient {
  id: string;
  username: string; // login id, lowercase
  name: string;
  role: UserRole;
  avatarUrl: string;
  password?: string;
  lastNotificationsClear?: string; // ISO string
}

export interface ActionLog {
  id: string;
  username: string;
  workerName: string;
  action: string;
  timestamp: string; // ISO string
}


export interface BikiniStockDivided {
  embalados: number;
  naBase: number;
  paraConsertos: number;
  emRecorte: number;
  emProducao: number;
  sobras: number;
}

export interface Bikini {
  id: string;
  model: string;
  colorName: string;
  colorHex: string;
  size: Size;
  stock: number;
  minStockAlert: number;
  dividedStock?: BikiniStockDivided;
}

export interface Thread {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  colorCode?: string;
  stock: number;
  minStockAlert: number;
}

export interface SaleItem {
  productId: string;
  type: 'bikini' | 'thread';
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  date: string; // ISO String
  items: SaleItem[];
  total: number;
}

export interface UserStory {
  id: string;
  userId: string;
  type: 'image' | 'text' | 'audio';
  content: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface GalleryPost {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likes: string[];
  comments?: PostComment[];
  isPinned?: boolean;
}

export interface ZPLLabel {
  transporte: string;
  lote: string;
  totalVolumes: number;
}
