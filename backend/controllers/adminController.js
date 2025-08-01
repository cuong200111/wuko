import { executeQuery } from "../database/connection.js";

export const adminController = {
  // Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      // Get products statistics
      const productsStats = await executeQuery(
        `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN featured = 1 THEN 1 END) as featured,
          COUNT(CASE WHEN stock_quantity <= 5 THEN 1 END) as low_stock
        FROM products
      `,
        []
      );

      // Get categories statistics
      const categoriesStats = await executeQuery(
        `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active
        FROM categories
      `,
        []
      );

      // Get users statistics
      const usersStats = await executeQuery(
        `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN role = 'user' THEN 1 END) as customers,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
        FROM users
      `,
        []
      );

      // Get orders statistics
      const ordersStats = await executeQuery(
        `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
          COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
        FROM orders
      `,
        []
      );

      // Get revenue from delivered and completed orders
      const revenueStats = await executeQuery(
        `
        SELECT
          COALESCE(SUM(CASE WHEN status IN ('delivered', 'completed') THEN total_amount ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN status IN ('cancelled', 'failed') THEN total_amount ELSE 0 END), 0) as lost_revenue
        FROM orders
      `,
        []
      );

      // Get successful and failed orders count
      const orderStatusStats = await executeQuery(
        `
        SELECT
          COUNT(CASE WHEN status IN ('delivered', 'completed') THEN 1 END) as successful_orders,
          COUNT(CASE WHEN status IN ('cancelled', 'failed') THEN 1 END) as failed_orders
        FROM orders
      `,
        []
      );

      const dashboardStats = {
        products: {
          total: productsStats[0]?.total || 0,
          active: productsStats[0]?.active || 0,
          featured: productsStats[0]?.featured || 0,
          low_stock: productsStats[0]?.low_stock || 0,
        },
        categories: {
          total: categoriesStats[0]?.total || 0,
          active: categoriesStats[0]?.active || 0,
        },
        users: {
          total: usersStats[0]?.total || 0,
          customers: usersStats[0]?.customers || 0,
          admins: usersStats[0]?.admins || 0,
        },
        orders: {
          total: ordersStats[0]?.total || 0,
          pending: ordersStats[0]?.pending || 0,
          processing: ordersStats[0]?.processing || 0,
          shipped: ordersStats[0]?.shipped || 0,
          delivered: ordersStats[0]?.delivered || 0,
          completed: ordersStats[0]?.completed || 0,
          cancelled: ordersStats[0]?.cancelled || 0,
          failed: ordersStats[0]?.failed || 0,
          successful: orderStatusStats[0]?.successful_orders || 0,
          failed_total: orderStatusStats[0]?.failed_orders || 0,
        },
        revenue: {
          total: revenueStats[0]?.total_revenue || 0,
          lost: revenueStats[0]?.lost_revenue || 0,
        },
      };

      res.json({
        success: true,
        data: dashboardStats,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Không thể lấy thống kê dashboard",
        error: error.message,
      });
    }
  },

  // Core Web Vitals
  async getCoreWebVitals(req, res) {
    try {
      // Simulate core web vitals data
      const vitals = {
        lcp: Math.random() * 2.5 + 1.0, // Largest Contentful Paint
        fid: Math.random() * 100, // First Input Delay
        cls: Math.random() * 0.1, // Cumulative Layout Shift
        fcp: Math.random() * 1.8 + 0.5, // First Contentful Paint
        ttfb: Math.random() * 0.8 + 0.2, // Time to First Byte
      };

      res.json({
        success: true,
        data: vitals,
      });
    } catch (error) {
      console.error("Core web vitals error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get core web vitals",
      });
    }
  },

  // Populate Categories
  async populateCategories(req, res) {
    try {
      const sampleCategories = [
        {
          name: "Laptop",
          slug: "laptop",
          description: "Laptop văn phòng và gaming",
          image: "placeholder.svg",
          sort_order: 1,
        },
        {
          name: "PC Gaming",
          slug: "pc-gaming",
          description: "Máy tính để bàn gaming",
          image: "placeholder.svg",
          sort_order: 2,
        },
        {
          name: "Linh kiện máy tính",
          slug: "linh-kien-may-tinh",
          description: "CPU, RAM, Mainboard, VGA",
          image: "placeholder.svg",
          sort_order: 3,
        },
        {
          name: "Phụ kiện gaming",
          slug: "phu-kien-gaming",
          description: "Chuột, bàn phím, tai nghe gaming",
          image: "placeholder.svg",
          sort_order: 4,
        },
        {
          name: "Màn hình",
          slug: "man-hinh",
          description: "Màn hình gaming và văn phòng",
          image: "placeholder.svg",
          sort_order: 5,
        },
        {
          name: "Thiết bị mạng",
          slug: "thiet-bi-mang",
          description: "Router, Switch, Access Point",
          image: "placeholder.svg",
          sort_order: 6,
        },
      ];

      let created = 0;
      for (const category of sampleCategories) {
        try {
          const existing = await executeQuery(
            "SELECT id FROM categories WHERE slug = ?",
            [category.slug]
          );

          if (existing.length === 0) {
            await executeQuery(
              `INSERT INTO categories (name, slug, description, image, sort_order, is_active, created_at) 
               VALUES (?, ?, ?, ?, ?, 1, NOW())`,
              [
                category.name,
                category.slug,
                category.description,
                category.image,
                category.sort_order,
              ]
            );
            created++;
          }
        } catch (err) {
          console.error(`Error creating category ${category.name}:`, err);
        }
      }

      res.json({
        success: true,
        message: `Successfully populated ${created} categories`,
        data: { created, total: sampleCategories.length },
      });
    } catch (error) {
      console.error("Populate categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to populate categories",
      });
    }
  },

  // Setup Admin
  async setupAdmin(req, res) {
    try {
      const adminEmail = "admin@zoxvn.com";
      const adminPassword = "admin123";

      // Check if admin already exists
      const existingAdmin = await executeQuery(
        "SELECT id FROM users WHERE email = ?",
        [adminEmail]
      );

      if (existingAdmin.length > 0) {
        return res.json({
          success: true,
          message: "Admin user already exists",
          data: { admin_id: existingAdmin[0].id },
        });
      }

      // Create admin user
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const result = await executeQuery(
        `INSERT INTO users (email, password, full_name, role, is_active, created_at) 
         VALUES (?, ?, ?, 'admin', 1, NOW())`,
        [adminEmail, hashedPassword, "Admin ZOXVN"]
      );

      res.json({
        success: true,
        message: "Admin user created successfully",
        data: { admin_id: result.insertId },
      });
    } catch (error) {
      console.error("Setup admin error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to setup admin",
      });
    }
  },

  // Generate Robots.txt
  async generateRobots(req, res) {
    try {
      const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml

# Crawl-delay
Crawl-delay: 1`;

      res.json({
        success: true,
        data: { content: robotsContent },
      });
    } catch (error) {
      console.error("Generate robots error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate robots.txt",
      });
    }
  },

  // Generate Sitemap
  async generateSitemap(req, res) {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      // Get categories
      const categories = await executeQuery(
        "SELECT slug FROM categories WHERE is_active = 1"
      );
      
      // Get products
      const products = await executeQuery(
        "SELECT id FROM products WHERE status = 'active'"
      );

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

      // Add category URLs
      for (const category of categories) {
        sitemap += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }

      // Add product URLs
      for (const product of products) {
        sitemap += `
  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }

      sitemap += `
</urlset>`;

      res.json({
        success: true,
        data: { content: sitemap },
      });
    } catch (error) {
      console.error("Generate sitemap error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate sitemap",
      });
    }
  },

  // Validate XML
  async validateXml(req, res) {
    try {
      const { xml } = req.body;
      
      if (!xml) {
        return res.status(400).json({
          success: false,
          message: "XML content is required",
        });
      }

      // Basic XML validation
      const isValid = xml.includes('<?xml') && xml.includes('</');
      
      res.json({
        success: true,
        data: { 
          isValid,
          message: isValid ? "XML is valid" : "XML is invalid"
        },
      });
    } catch (error) {
      console.error("Validate XML error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate XML",
      });
    }
  },
};
