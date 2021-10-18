/*
   path: api/hero
*/
const { Router } = require("express");
const { check } = require("express-validator");
const {
  addHero,
    getHeroes,
  deleteHero,
  updateHero,
  getHero,
  generatePdf,
  generateExcel,
} = require("../controllers/hero");
const { fieldsValidator } = require("../middlewares/fields-validator");

const router = Router();

// Registro de heroes
router.post(
  "/create",
  [
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("alias", "El alias es obligatorio").not().isEmpty(),
    fieldsValidator,
  ],
  addHero
);

// obtener todos los heroes
router.get("/getAll", getHeroes);

// Eliminar un heroe
router.delete("/delete/:uuid", deleteHero);

// Obtener un heroe
router.get("/get/:uuid", getHero);

// Generar reporte de héroes en pdf
router.get("/generatePdf", generatePdf);

// Generar reporte de héroes en un excel
router.get("/generateExcel", generateExcel);

// Registro de heroes
router.put(
  "/update/:uuid",
  [
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("alias", "El alias es obligatorio").not().isEmpty(),
    fieldsValidator,
  ],
  updateHero
);

module.exports = router;
