const app = require("../controllers/hero");
const chai = require("chai");
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const ap = require("express");
const AWS = require("aws-sdk");

chai.use(chaiHttp);
const url = 'http://localhost:3000/api/hero';

/*describe("Add Hero", function () {
  it("Add hero success", (done) => {
    const data = {
      "name": "Jaime",
      "alias": "Storm",
      "species": "Mutant",
      "company": {
        "name": "Marvel",
        "team": "X-Men"
      }
    };

    chai.request(url)
        .post('/create')
        .send(data)
        .end( function(err,res){
          console.log('err: ', err)
          console.log(res.body)
            chai.expect(res).to.have.status(200);
          done();
        });

  });
});*/

let sandbox;

describe("Add Hero controller", function () {
    before(() => {
        sandbox = sinon.createSandbox();
        process.env.IS_OFFLINE = true;
    });

    after(() => {
        sandbox.restore();
    });

    it("Add hero success", (done) => {
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'put').returns(function(params, callback) {
            callback(null, {Items: [1, 2, 3]});
        });

        const data = {
            "name": "Jaime",
            "alias": "Storm",
            "species": "Mutant",
            "company": {
                "name": "Marvel",
                "team": "X-Men"
            }
        };
        const res = ap.response;
        const req = {body: data};
        app.addHero(req, res);
        chai.expect(res.statusCode).to.equal(200);
        done();
    });
});

describe("update Hero controller", function () {

    before(() => {
        sandbox = sinon.createSandbox();
        process.env.HEROES_TABLE = 'heroes-dev';
    });

    after(() => {
        sandbox.restore();
    });

    it("update hero success", (done) => {
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'update').returns(function(params, callback) {
            callback(null, {});
        });

        const data = {
            "name": "Jaime",
            "alias": "Storm",
            "species": "Mutant",
            "company": {
                "name": "Marvel",
                "team": "X-Men"
            }
        };
        const res = ap.response;
        const req = {params:'ww-332',body: data};
        app.updateHero(req, res);
        chai.expect(res.statusCode).to.equal(200);
        done();
    });
});

describe("delete Hero controller", function () {

    before(() => {
        sandbox = sinon.createSandbox();
        process.env.HEROES_TABLE = 'heroes-dev';
    });

    after(() => {
        sandbox.restore();
    });

    it("delete hero success", (done) => {
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'delete').returns(function(params, callback) {
            callback(null, {});
        });
        const res = ap.response;
        const req = {params:'ww-332'};
        app.deleteHero(req, res);
        chai.expect(res.statusCode).to.equal(200);
        done();
    });
});

describe("get Hero controller", function () {

    before(() => {
        sandbox = sinon.createSandbox();
        process.env.HEROES_TABLE = 'heroes-dev';
    });

    after(() => {
        sandbox.restore();
    });

    it("get hero success", (done) => {
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'get').returns(function(params, callback) {
            callback(null, {});
        });
        const res = ap.response;
        const req = {params:'ww-332'};
        app.getHero(req, res);
        chai.expect(res.statusCode).to.equal(200);
        done();
    });
});

describe("generatePdf Heroes controller", function () {
    before(() => {
        sandbox = sinon.createSandbox();
        process.env.HEROES_TABLE = 'heroes-dev';
    });

    after(() => {
        sandbox.restore();
    });

    it("generatePdf heroes success", (done) => {
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'scan').returns({
            promise: function () {
                return Promise.resolve({
                    Items: [
                        {
                            "alias": "Storm",
                            "company": {
                                "name": "Marvel",
                                "team": "X-Men"
                            },
                            "id": "69f32d6f-8e89-4f37-9cee-e2211156aa41",
                            "name_hero": "Jaime",
                            "species": "Mutant"
                        },
                        {
                            "alias": "Acuaman",
                            "company": {
                                "name": "DC",
                                "team": "Justice League"
                            },
                            "id": "858ee05c-903d-4a06-86f5-ee1740273a8f",
                            "name_hero": "Frank",
                            "species": "Human"
                        },
                    ]
                });
            }
        });

        const res = ap.response;
        const req = {};
        app.generatePdf(req, res);
        chai.expect(res.statusCode).to.equal(200);
        done();
    });
});

describe("generateExcel Heroes controller", function () {
    before(() => {
        sandbox = sinon.createSandbox();
        process.env.HEROES_TABLE = 'heroes-dev';
    });

    after(() => {
        sandbox.restore();
    });

    it("generateExcel heroes success", (done) => {
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'scan').returns({
            promise: function () {
                return Promise.resolve({
                    Items: [
                        {
                            "alias": "Storm",
                            "company": {
                                "name": "Marvel",
                                "team": "X-Men"
                            },
                            "id": "69f32d6f-8e89-4f37-9cee-e2211156aa41",
                            "name_hero": "Jaime",
                            "species": "Mutant"
                        },
                        {
                            "alias": "Acuaman",
                            "company": {
                                "name": "DC",
                                "team": "Justice League"
                            },
                            "id": "858ee05c-903d-4a06-86f5-ee1740273a8f",
                            "name_hero": "Frank",
                            "species": "Human"
                        },
                    ]
                });
            }
        });

        const res = ap.response;
        const req = {};
        app.generateExcel(req, res);
        chai.expect(res.statusCode).to.equal(200);
        done();
    });
});

describe("getAll Heroes controller", function () {
    it("getAll heroes success", (done) => {
        sandbox.stub(AWS.DynamoDB.DocumentClient.prototype, 'scan').returns({
            promise: function () {
                return Promise.resolve({Items: [1, 2, 3]});
            }
        });

        const res = ap.response;
        const req = {};
        app.getHeroes(req, res);
        chai.expect(res.statusCode).to.equal(200);
        done();
    });
});

describe("Add Hero fail", function () {
    it("Add hero failed", (done) => {
        const data = {
            "name": "Jaime",
            "alias": "Storm",
            "species": "Mutant",
            "company": {
                "name": "Marvel",
                "team": "X-Men"
            }
        };
        const res = ap.response;
        const req = {body: data};

        app.addHero(req, res);
        chai.expect(res.statusCode).to.equal(500);
        done();
    });

});

describe("Update Hero fail", function () {
    it("Update hero failed", (done) => {
        const data = {
            "name": "Jaime",
            "alias": "Storm",
            "species": "Mutant",
            "company": {
                "name": "Marvel",
                "team": "X-Men"
            }
        };
        const res = ap.response;
        const req = {params:'ww-332',body: data};

        app.updateHero(req, res);
        chai.expect(res.statusCode).to.equal(500);
        done();
    });
});

describe("delete Hero fail", function () {
    it("delete hero failed", (done) => {
        const res = ap.response;
        const req = {params:'ww-332'};

        app.deleteHero(req, res);
        chai.expect(res.statusCode).to.equal(500);
        done();
    });
});

describe("get Hero fail", function () {
    it("get hero failed", (done) => {
        const res = ap.response;
        const req = {params:'ww-332'};

        app.getHero(req, res);
        chai.expect(res.statusCode).to.equal(500);
        done();
    });
});

describe("generatePdf Heroes fail", function () {

    it("generatePdf heroes failed", (done) => {
        const res = ap.response;
        const req = {};
        app.generatePdf(req, res);
        chai.expect(res.statusCode).to.equal(500);
        done();
    });
});

describe("generateExcel Heroes fail", function () {

    it("generateExcel heroes failed", (done) => {
        const res = ap.response;
        const req = {};
        app.generateExcel(req, res);
        chai.expect(res.statusCode).to.equal(500);
        done();
    });
});

