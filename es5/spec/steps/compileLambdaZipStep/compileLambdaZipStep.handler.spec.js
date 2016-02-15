"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _conan = require("conan");

var _conan2 = _interopRequireDefault(_conan);

var _compileLambdaZipStep = require("../../../lib/steps/compileLambdaZipStep.js");

var _compileLambdaZipStep2 = _interopRequireDefault(_compileLambdaZipStep);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _unzip = require("unzip2");

var _unzip2 = _interopRequireDefault(_unzip);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_temp2.default.track();

describe(".compileLambdaZipStep(conan, context, stepDone)", function () {
	var conan = undefined,
	    context = undefined,
	    stepDone = undefined,
	    lambdaFilePath = undefined,
	    handlerFilePath = undefined,
	    stepReturnData = undefined,
	    conanAwsLambda = undefined;

	beforeEach(function (done) {
		conan = new _conan2.default({
			basePath: __dirname + "../../../../../es6",
			region: "us-east-1"
		});

		lambdaFilePath = __dirname + "/../../fixtures/lambda.js";
		handlerFilePath = __dirname + "/../../fixtures/customHandler.js";

		conanAwsLambda = new (function () {
			function MockConanAwsLambda() {
				_classCallCheck(this, MockConanAwsLambda);
			}

			_createClass(MockConanAwsLambda, [{
				key: "name",
				value: function name() {
					return "MyLambda";
				}
			}, {
				key: "handler",
				value: function handler() {
					return ["handler", handlerFilePath];
				}
			}]);

			return MockConanAwsLambda;
		}())();

		var filePath = lambdaFilePath;
		conanAwsLambda.filePath = _sinon2.default.spy(function (newFilePath) {
			if (newFilePath) {
				filePath = newFilePath;
			}
			return filePath;
		});

		var dependencies = [];
		conanAwsLambda.dependencies = _sinon2.default.spy(function (newDependencies) {
			if (newDependencies) {
				dependencies.push([newDependencies]);
			}
			return dependencies;
		});

		_temp2.default.mkdir("compileLambdaZip", function (error, temporaryDirectoryPath) {
			context = {
				temporaryDirectoryPath: temporaryDirectoryPath,
				parameters: conanAwsLambda,
				results: {}
			};

			stepDone = function stepDone(callback) {
				return function (callbackError, data) {
					stepReturnData = data;
					callback();
				};
			};

			(0, _compileLambdaZipStep2.default)(conan, context, stepDone(done));
		});
	});

	describe("(When .handler is a file path)", function () {
		it("should move the lambda file path to dependencies", function () {
			conanAwsLambda.dependencies.calledWith(lambdaFilePath).should.be.true;
		});
		it("should set the handler file path as the lambda file path", function () {
			conanAwsLambda.filePath.calledWith(handlerFilePath).should.be.true;
		});

		it("should insert the lambda file, the dependency, and its packages into the zip file", function (done) {
			/* eslint-disable new-cap */
			var zipFilePaths = [];

			_fs2.default.createReadStream(stepReturnData.lambdaZipFilePath).pipe(_unzip2.default.Parse()).on("entry", function (entry) {
				zipFilePaths.push(entry.path);
			}).on("close", function () {
				var expectedFilePaths = ["spec/fixtures/lambda.js", "customHandler.js"];

				zipFilePaths.should.have.members(expectedFilePaths);

				done();
			});
		});
	});
});