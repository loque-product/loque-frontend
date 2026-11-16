import type { PortfolioService } from "./contract"
import { httpPortfolioService } from "./http"

export type { PortfolioService } from "./contract"
export const portfolioService: PortfolioService = httpPortfolioService
