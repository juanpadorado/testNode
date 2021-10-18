const { response } = require("express");
const AWS = require("aws-sdk");
const Hero = require("../models/hero");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const writeXlsxFile = require("write-excel-file/node");

const dynamoDbClientParams = {};
if (process.env.IS_OFFLINE) {
  dynamoDbClientParams.region = "localhost";
  dynamoDbClientParams.endpoint = "http://localhost:8000";
}
const dynamoDB = new AWS.DynamoDB.DocumentClient(dynamoDbClientParams);
//const dynamoDB = new AWS.DynamoDB.DocumentClient();

const table = process.env.HEROES_TABLE;

const addHero = async (req, res = response) => {
  const hero = new Hero(
    uuidv4(),
    req.body.name,
    req.body.alias,
    req.body.species,
    req.body.company
  );

  try {
    const params = {
      TableName: table,
      Item: hero,
    };

    dynamoDB.put(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to add item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return res.json({
          ok: false,
          msg: err.message,
        });
      } else {
        return res.json({
          ok: true,
          msg: "Héroe creado correctamente.",
          hero,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrio un error interno en el servidor.",
    });
  }
};

const getHeroes = async (req, res = response) => {
  try {
    const heroes = await scanTable(table);
    return res.json({
      ok: true,
      heroes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrio un error interno en el servidor.",
    });
  }
};

const scanTable = async (tableName) => {
  const params = {
    TableName: tableName,
  };

  const scanResults = [];
  let items;
  do {
    items = await dynamoDB.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== "undefined");

  return scanResults;
};

const deleteHero = async (req, res = response) => {
  try {
    const id = req.params.uuid;
    const params = {
      TableName: table,
      Key: {
        id,
      },
      ConditionExpression: "id = :val",
      ExpressionAttributeValues: {
        ":val": id,
      },
    };

    dynamoDB.delete(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to add item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return res.json({
          ok: false,
          msg: err.message,
        });
      } else {
        return res.json({
          ok: true,
          msg: "Se eliminó el héroe correctamente.",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrio un error interno en el servidor.",
    });
  }
};

const updateHero = async (req, res = response) => {
  const hero = new Hero(
    req.params.uuid,
    req.body.name,
    req.body.alias,
    req.body.species,
    req.body.company
  );
  try {
    const params = {
      TableName: table,
      Key: {
        id: hero.id,
      },
      UpdateExpression: "set name_hero = :n, alias=:a, species=:s, company=:c",
      ExpressionAttributeValues: {
        ":n": hero.name_hero,
        ":a": hero.alias,
        ":s": hero.species,
        ":c": hero.company,
      },
      ReturnValues: "UPDATED_NEW",
    };

    dynamoDB.update(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to add item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return res.json({
          ok: false,
          msg: err.message,
        });
      } else {
        return res.json({
          ok: true,
          msg: "Héroe actualizado correctamente.",
          hero,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrio un error interno en el servidor.",
    });
  }
};

const getHero = async (req, res = response) => {
  try {
    const id = req.params.uuid;

    const params = {
      TableName: table,
      Key: {
        id,
      },
    };

    dynamoDB.get(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to add item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return res.json({
          ok: false,
          msg: err.message,
        });
      } else {
        return res.json({
          ok: true,
          msg: data.Item ? undefined : "El héroe no se encuentra registrado.",
          hero: data.Item,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrio un error interno en el servidor.",
    });
  }
};

const generatePdf = async (req, res = response) => {
  try {
    const heroes = await scanTable(table);

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const pathA= '/tmp/report.pdf';
    const writeStream = fs.createWriteStream(pathA);
    // file name
    doc.pipe(writeStream);

    // table
    const dataTable = {
      title: "Heroes Report",
      subtitle: "",
      headers: [
        { label: "Name", property: "name_hero", width: 100, renderer: null },
        {
          label: "Alias",
          property: "alias",
          width: 100,
          renderer: null,
        },
        { label: "Species", property: "species", width: 100, renderer: null },
        {
          label: "Company Name",
          property: "company",
          width: 100,
          renderer: (value, indexColumn, indexRow, row) => {
            return row.company.name;
          },
        },
        {
          label: "Company Team",
          property: "company",
          width: 100,
          renderer: (value, indexColumn, indexRow, row) => {
            return row.company.team;
          },
        },
      ],
      datas: heroes,
    };

    doc.table(dataTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font("Helvetica").fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow, "blue", 0.15);
      },
    });
    // done!
    doc.end();

    writeStream.on("finish", function () {
      const file = base64_encode(pathA);
      fs.unlinkSync(pathA);
      return res.json({
        ok: true,
        base64File: file,
        message:
          "To download or view visit https://base64.guru/converter/decode/file",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrio un error interno en el servidor.",
    });
  }
};

const generateExcel = async (req, res = response) => {
  try {
    const heroes = await scanTable(table);

    const schema = [
      {
        column: 'Name',
        type: String,
        value: hero => hero.name_hero
      },
      {
        column: 'Alias',
        type: String,
        value: hero => hero.alias
      },
      {
        column: 'Species',
        type: String,
        value: hero => hero.species
      },
      {
        column: 'Company Name',
        type: String,
        value: hero => hero.company.name
      },
      {
        column: 'Company Team',
        type: String,
        value: hero => hero.company.team
      }
    ]

    const pathA = "/tmp/file.xlsx";
    await writeXlsxFile(heroes, {
      schema, // optional
      filePath: pathA,
    });

    const file = base64_encode(pathA);
    fs.unlinkSync(pathA);
    res.json({
      ok: true,
      base64File: file,
      message:
        "To download or view visit https://base64.guru/converter/decode/file",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrio un error interno en el servidor.",
    });
  }
};

function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer.from(bitmap).toString("base64");
}

module.exports = {
  addHero,
  getHeroes,
  deleteHero,
  updateHero,
  getHero,
  generatePdf,
  generateExcel,
};
