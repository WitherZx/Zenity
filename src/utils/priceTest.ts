import { REVENUECAT_CONFIG } from '../config/revenueCatConfig';

// Função de teste para verificar formatação de preços
export const testPriceFormatting = () => {
  console.log('🧪 Testando formatação de preços...');
  
  // Teste para Brasil (português)
  const brazilConfig = REVENUECAT_CONFIG.REGIONS.brazil;
  console.log('🇧🇷 Brasil:', brazilConfig.fallbackPrice);
  
  // Teste para EUA (inglês)
  const usaConfig = REVENUECAT_CONFIG.REGIONS.usa;
  console.log('🇺🇸 EUA:', usaConfig.fallbackPrice);
  
  // Simular preços do RevenueCat
  const mockRevenueCatPrices = [
    'R$ 19,90',
    '$4.99',
    'R$ 19,90/semana',
    '$4.99/week',
    '19.90 BRL',
    '4.99 USD'
  ];
  
  console.log('📊 Preços simulados do RevenueCat:');
  mockRevenueCatPrices.forEach(price => {
    const isDollar = price.includes('$') || price.includes('USD');
    const isReal = price.includes('R$') || price.includes('BRL');
    
    if (isDollar) {
      console.log(`  ${price} → EUA: ${price.includes('week') ? price : `${price}/week`}`);
    } else if (isReal) {
      console.log(`  ${price} → Brasil: ${price.includes('semana') ? price : `${price}/semana`}`);
    } else {
      console.log(`  ${price} → Formato não reconhecido`);
    }
  });
  
  return {
    brazil: brazilConfig.fallbackPrice,
    usa: usaConfig.fallbackPrice,
    testPrices: mockRevenueCatPrices
  };
}; 