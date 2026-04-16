import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Aashirvaad Atta 5kg',
    sku: 'ASH-5KG-A',
    price: 250,
    stock: 4,
    maxStock: 10,
    status: 'CRITICAL',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNc39PA33MFk8IwAHpHv3qpkm52fB5HMVa5A1WJ_H-ooBt-Q1nHTwWTP9Ojkez5VrP_5884IvXnSQytbczl1-vFS7hGjZVQ4jPY_TBH4PlblE5XJltaLORUhEmtt0cKXJCtm8ROPi5x1Ze-jwCgFcAjKpRlVkokPw95I2epS9VCsuvJWgbPi8iwjoYRRsBI-Nf9xKTvgh8muQ4gd4hV7uREvYr8WH2_PRZbMJIse6WBpgpzKUfMmWSZKd7k8RdpPUPhSlYhzfwDomj',
    category: 'Staples',
    description: 'Whole wheat flour'
  },
  {
    id: '2',
    name: 'Amul Butter 100g',
    sku: 'AMU-100-B',
    price: 54,
    stock: 0,
    maxStock: 5,
    status: 'CRITICAL',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoFl1ooqNK3RkBSoogyxmLdH3ore4OovOXKWhcPm0ogwkyi6dFJCDO28KRS_CIktaQfXAFR7xTN46n_iWWHIrlqJ7o5iUX8PfSvd89xd1AZ9-WNVk5uDQUkIu6HbGk3Z6v53nYZC9ChIF54JZ1FMATD9jy8BEx1aeF7jAbaY5WYN-M6ULCKhpbhjoMRhtuoYxfkBJlV25pBkywo90DBqPb8OO-yN6uRf2swULTSO-I8kW09No0NqlcvLWhkTEU9AQRFhn8TYtvIX_v',
    category: 'Dairy',
    description: 'Pure milk butter'
  },
  {
    id: '3',
    name: 'Tata Salt 1kg',
    sku: 'TAT-1KG-S',
    price: 25,
    stock: 45,
    maxStock: 20,
    status: 'HEALTHY',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnL5eUfP9cgrPvDVLQ9a4uO0-i5Ypt1deq5KQcgRmBFgV_KWLeu_RdQ_dE2GlU3d2NSM1kxrW5hru6fMQXrj4m2Dp2kYa8EdE9LFCsEu4QrcWeq67_-xGDMsqgm2nbP-m02ZSNBqR8xvmlPjxpBhAITZcAfsrarv5Y_cdVHAHDdEQPp_3UCTB-V504hbJ1vQxoim1cOpkhiGO-Vh5D-0VkttrucuSHglxl6t_52Tm-kl6YxGMijY6KNNCsEb4dZawJWFn4PZIdqqFN',
    category: 'Staples',
    description: 'Vacuum evaporated salt'
  },
  {
    id: '4',
    name: 'Maggi 2-Min Noodles',
    sku: 'MAG-70G-N',
    price: 14,
    stock: 12,
    maxStock: 15,
    status: 'WARNING',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmsqn77-eEXOj9R5e435Onq7kgo72ukZ5INFmmKH77e_6pdKnaXu43EO7LSLWnpDBgbFmlcrDKbNCNhgicI9yyH8gPvnhWjNJSki1037n6ZwgPNRtpev28_uG82EXSgdxwSr5_yPzh-j9zs3ckXKIqXKApchrinj_iqaNC8QOl4cb1A7hP1TL8c1mlJ003otxLFhg_t6wNlx53sicT_06YyJOVj3r8rAZriwzOk4gJrTbrWjr_h5FIYYfwp3xEVqexufQhv3CcL9vU',
    category: 'Snacks',
    description: 'Instant noodles'
  }
];
