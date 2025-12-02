// src/controllers/HomeController.js
class HomeController {
  async index(req, res) {
    return res.json({ message: 'API Biosphere online ✅' });
  }
}

export default new HomeController();
