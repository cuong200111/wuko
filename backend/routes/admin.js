import express from "express";
import { adminController } from "../controllers/adminController.js";
import { reportsController } from "../controllers/reportsController.js";
import { shippingController } from "../controllers/shippingController.js";
import { seoController } from "../controllers/seoController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard & Analytics
router.get("/dashboard-stats", adminController.getDashboardStats);
router.get("/core-web-vitals", adminController.getCoreWebVitals);

// Setup & Management
router.post("/setup-admin", adminController.setupAdmin);
router.post("/populate-categories", adminController.populateCategories);

// SEO Management
router.get("/seo-status", seoController.getSeoStatus);
router.post("/seo-audit", seoController.performSeoAudit);
router.get("/seo-settings", seoController.getSeoSettings);
router.put("/seo-settings", seoController.updateSeoSettings);
router.post("/seo-settings",seoController.saveSeoSettings);
router.post("/seo-content-analysis", seoController.analyzeContent);
router.get("/seo-performance", seoController.getPerformanceMetrics);
router.get("/seo-ai-recommendations", seoController.getAiRecommendations);
router.post("/seo-auto-fix", seoController.autoFixSeoIssues);
router.post("/seo-bulk-update", seoController.bulkUpdateSeo);
router.get("/seo-international", seoController.getInternationalSeo);
router.post("/seo-link-optimization", seoController.optimizeLinks);
router.post("/seo-test-all", seoController.testAllSeo);

// Robots & Sitemap
router.post("/generate-robots", adminController.generateRobots);
router.post("/generate-sitemap", adminController.generateSitemap);
router.post("/validate-xml", adminController.validateXml);

// Shipping Management
router.get("/shipping-rates", shippingController.getShippingRates);
router.post("/shipping-rates", shippingController.createShippingRate);
router.get("/shipping-zones", shippingController.getShippingZones);
router.post("/shipping-zones", shippingController.createShippingZone);
router.get("/warehouses", shippingController.getWarehouses);
router.post("/warehouses", shippingController.createWarehouse);

// Reports
router.get("/reports/customers", reportsController.getCustomerReports);
router.get("/reports/products", reportsController.getProductReports);
router.get("/reports/sales", reportsController.getSalesReports);

export default router;
