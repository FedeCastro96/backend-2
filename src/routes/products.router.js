import express from "express";
import fileManager from "../manager/fileManager.js";
const { FileManager, ProductManager } = fileManager;

const router = express.Router();
const productManager = new ProductManager("./data/products.json");
//Array inicial de productos para pruebas

//funcion para generar el id automaticamente:
const generateId = async () => {
  const products = await productManager.getProducts();
  if (products.length === 0) return 1;
  return Math.max(...products.map((p) => p.id)) + 1;
};

//GET/api/products
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    let limit = req.query.limit;
    if (limit) {
      res.send(products.slice(0, limit));
      //para ver el límite --> http://localhost:8080/api/products?limit=1
    } else {
      res.send(products);
      // para ver el array de productos --> http://localhost:8080/api/products
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    let productId = parseInt(req.params.pid);
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }

  const product = products.find((p) => p.id === productId);
});

//POST/api/products
router.post("/", async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//PUT/api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    const productId = parseInt(req.params.pid);
    const index = products.findIndex((p) => p.id === productId);

    //verificar si el producto existe
    if (index === -1) {
      return res.status(404).json({
        error: "Producto no encontrado.",
      });
    }

    //Actualizamos el producto
    products[index] = {
      ...products[index], // Mantenemos los datos originales
      ...req.body, // Actualizamos con los nuevos datos
      id: productId, // Nos aseguramos de mantener el id original
    };

    await productManager.writeFile(products);
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar el producto",
      details: error.message,
    });
  }
});

//DELETE/api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    const productId = parseInt(req.params.pid);
    const index = products.findIndex((p) => p.id === productId);

    //Verificar si el producto existe
    if (index === -1) {
      return res.status(404).json({
        error: "Producto no encontrado.",
      });
    }
    // Eliminamos el producto
    products.splice(index, 1);
    await productManager.writeFile(products);

    res.json({
      status: "success",
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar el producto",
      details: error.message,
    });
  }
});

export { router as productsRouter };
