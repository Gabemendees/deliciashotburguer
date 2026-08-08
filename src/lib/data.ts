import { Product, Addition, DeliveryArea } from '../types/burger';

export const WHATSAPP_NUMBER = "99701-3096";
export const STORE_ADDRESS = {
  street: "R. Santa Maria",
  number: "714",
  neighborhood: "Pedra Azul",
  city: "Contagem",
  state: "MG",
  zip: "32183-970",
  reference: "Trailer em frente ao Correio",
  mapsLink: "https://maps.app.goo.gl/c9iTjBUfrkpBoN9F6"
};

export const PRODUCTS: Product[] = [
  // HOT DOGS
  { id: '1', number: '01', name: 'HOT DOG ORIGINAL', description: 'Pão, salsicha e mostarda.', price: 6.00, category: 'HOT DOGS' },
  { id: '2', number: '02', name: 'HOT DOG SIMPLES', description: 'Pão, salsicha, milho e batata.', price: 10.00, category: 'HOT DOGS' },
  { id: '3', number: '03', name: 'DELÍCIA\'S HOT DOG TRADICIONAL', description: 'Pão, salsicha, mussarela, milho, ovo de codorna, batata palha, passas e orégano.', price: 12.00, category: 'HOT DOGS' },
  { id: '4', number: '04', name: 'HOT DOG BACON', description: 'Pão, salsicha, mussarela, milho, batata palha, bacon e orégano.', price: 13.00, category: 'HOT DOGS' },
  { id: '5', number: '05', name: 'HOT DOG 4 QUEIJOS', description: 'Pão, salsicha, mussarela, cheddar, catupiry, queijo especial e orégano.', price: 14.00, category: 'HOT DOGS' },
  { id: '6', number: '06', name: 'HOT DOG À BOLONHESA', description: 'Pão, salsicha, mussarela, milho, batata palha, queijo especial, molho à bolonhesa e orégano.', price: 15.00, category: 'HOT DOGS' },
  { id: '7', number: '07', name: 'HOT DOG ESPECIAL', description: 'Pão, salsicha, mussarela, milho, peito de frango desfiado, catupiry, batata palha e orégano.', price: 16.00, category: 'HOT DOGS' },
  { id: '8', number: '08', name: 'DELÍCIA\'S HOT DOG', description: 'Pão, 2 salsichas, mussarela, milho, 2 ovos de codorna, batata palha, passas e orégano.', price: 18.00, category: 'HOT DOGS' },
  { id: '9', number: '09', name: 'DOGÃO CAIPIRA', description: 'Pão, 2 salsichas, mussarela, milho, ovo caipira, cheddar, batata palha, passas e orégano.', price: 19.00, category: 'HOT DOGS' },
  { id: '10', number: '10', name: 'HOT DOGÃO BACON', description: 'Pão, 2 salsichas, mussarela, milho, batata, bacon e orégano.', price: 21.00, category: 'HOT DOGS' },
  { id: '11', number: '11', name: 'HOT DOGÃO ESPECIAL', description: 'Pão, 2 salsichas, mussarela, milho, peito de frango desfiado, catupiry, batata palha e orégano.', price: 23.00, category: 'HOT DOGS' },
  { id: '12', number: '12', name: 'HOT DOGÃO BRUTO', description: 'Pão, 3 salsichas, mussarela, cheddar, catupiry, milho, bacon, ovo caipira, passas, ovo de codorna, peito de frango desfiado, batata palha, molho à bolonhesa e orégano.', price: 30.00, category: 'HOT DOGS' },
  
  // HAMBÚRGUERES
  { id: '14', number: '14', name: 'HAMBURGUER SIMPLES', description: 'Pão, hambúrguer de boi, batata palha e salada.', price: 10.00, category: 'HAMBÚRGUERES' },
  { id: '15', number: '15', name: 'X-EGG', description: 'Pão, hambúrguer de boi, ovo, milho, batata palha e salada.', price: 12.00, category: 'HAMBÚRGUERES' },
  { id: '16', number: '16', name: 'X-BURGUER', description: 'Pão, hambúrguer de boi, mussarela, presunto, milho, batata palha e salada.', price: 13.00, category: 'HAMBÚRGUERES' },
  { id: '17', number: '17', name: 'X-EGG BURGUER', description: 'Pão, hambúrguer de boi, ovo, mussarela, presunto, milho, batata palha e salada.', price: 14.00, category: 'HAMBÚRGUERES' },
  { id: '18', number: '18', name: 'X-BACON', description: 'Pão, hambúrguer de boi, bacon, mussarela, milho, batata palha e salada.', price: 15.00, category: 'HAMBÚRGUERES' },
  { id: '19', number: '19', name: 'X-EGG BACON', description: 'Pão, hambúrguer de boi, ovo, bacon, mussarela, presunto, milho, batata palha e salada.', price: 17.00, category: 'HAMBÚRGUERES' },
  { id: '20', number: '20', name: 'X-TUDO', description: 'Pão, hambúrguer de boi, ovo, bacon, mussarela, presunto, frango desfiado, catupiry, milho, batata palha e salada.', price: 22.00, category: 'HAMBÚRGUERES' },
  { id: '21', number: '21', name: 'X-BURGÃO', description: 'Pão, 2 hambúrgueres de boi, ovo, bacon, mussarela, presunto, frango desfiado, milho, batata palha e salada.', price: 23.00, category: 'HAMBÚRGUERES' },
  { id: '22', number: '22', name: 'DELÍCIA\'S HOT BURGUER\'S', description: 'Pão, 2 hambúrgueres de boi, 2 hambúrgueres de frango, 2 ovos, bacon, 2 fatias de mussarela, 2 fatias de presunto, milho, batata palha e salada.', price: 33.00, category: 'HAMBÚRGUERES' },
  { id: '23', number: '23', name: 'X-FRAN DUPLO', description: 'Pão, 2 hambúrgueres de frango, 2 ovos, 2 fatias de mussarela, 2 fatias de presunto, bacon, milho, batata palha e salada.', price: 30.00, category: 'HAMBÚRGUERES' },
  { id: '24', number: '24', name: 'X-PICANHA', description: 'Pão, hambúrguer de picanha, ovo, bacon, mussarela, presunto, milho, batata palha e salada.', price: 23.00, category: 'HAMBÚRGUERES' },
  { id: '25', number: '25', name: 'X-TRI LEGAL', description: 'Pão, hambúrguer de boi, hambúrguer de frango, hambúrguer de picanha, 3 ovos, bacon, mussarela, cheddar, catupiry, milho, batata palha e salada.', price: 35.00, category: 'HAMBÚRGUERES' },
  { id: '26', number: '26', name: 'X-BASICÃO', description: 'Pão, 2 hambúrgueres de boi, bacon, ovo, presunto e mussarela.', price: 13.00, category: 'HAMBÚRGUERES' },

  // BEBIDAS (Preços deixados como 0 conforme instrução para serem editáveis)
  { id: 'b1', number: 'B1', name: '200ml', description: 'Bebida 200ml', price: 0, category: 'BEBIDAS' },
  { id: 'b2', number: 'B2', name: '220ml', description: 'Bebida 220ml', price: 0, category: 'BEBIDAS' },
  { id: 'b3', number: 'B3', name: '350ml', description: 'Bebida 350ml', price: 0, category: 'BEBIDAS' },
  { id: 'b4', number: 'B4', name: '600ml', description: 'Bebida 600ml', price: 0, category: 'BEBIDAS' },
  { id: 'b5', number: 'B5', name: '1L', description: 'Bebida 1L', price: 0, category: 'BEBIDAS' },
  { id: 'b6', number: 'B6', name: '2L', description: 'Bebida 2L', price: 0, category: 'BEBIDAS' },
];

// Adicionais removidos da categoria, mas mantidos como dados se necessário.
// O usuário pediu para remover a categoria "ACRÉSCIMOS".
export const ADDITIONS: Addition[] = [
  { name: 'Azeitona', price: 1.00 },
  { name: 'Ovo de codorna', price: 1.00 },
  { name: 'Orégano', price: 1.00 },
  { name: 'Salsicha', price: 2.00 },
  { name: 'Passas', price: 2.00 },
  { name: 'Ovo de caipira', price: 2.00 },
  { name: 'Milho', price: 2.50 },
  { name: 'Batata palha', price: 2.50 },
  { name: 'Catupiry', price: 4.00 },
  { name: 'Mussarela', price: 4.00 },
  { name: 'Cheddar', price: 5.00 },
  { name: 'Queijo especial', price: 5.00 },
  { name: 'Frango desfiado', price: 4.00 },
  { name: 'Bacon', price: 4.00 },
  { name: 'Presunto', price: 4.00 },
  { name: 'Molho à Bolonhesa', price: 4.00 },
  { name: 'Hambúrguer de boi', price: 3.00 },
  { name: 'Hambúrguer de frango', price: 3.50 },
  { name: 'Hambúrguer de picanha', price: 4.00 },
];

export const DELIVERY_AREAS: DeliveryArea[] = [
  { neighborhood: 'Centro', fee: 5.00 },
  { neighborhood: 'Bairro Novo', fee: 7.00 },
  // ... adicionar mais conforme necessário
];
