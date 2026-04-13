export { SupermarketRepository } from './supermarket.js';
export type {
  SupermarketProfile, CreateSupermarketInput, SupermarketFSMState,
  SupermarketProduct, CreateProductInput, ProductCategory,
  SupermarketOrder, CreateOrderInput, OrderLineItem, LoyaltyAccount,
  GuardResult,
} from './types.js';
export {
  isValidSupermarketTransition,
  guardClaimedToCacVerified,
  guardCacToNafdacCompliant,
  guardL2AiCap,
} from './types.js';
