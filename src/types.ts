export type Size = 'PP' | 'P' | 'M' | 'G' | 'GG';

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

export interface ZPLLabel {
  transporte: string;
  lote: string;
  totalVolumes: number;
}
