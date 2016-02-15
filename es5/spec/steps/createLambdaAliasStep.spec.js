"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _conan = require("conan");

var _conan2 = _interopRequireDefault(_conan);

var _createLambdaAliasStep = require("../../lib/steps/createLambdaAliasStep.js");

var _createLambdaAliasStep2 = _interopRequireDefault(_createLambdaAliasStep);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

describe(".createLambdaAliasStep(conan, context, stepDone)", function () {
	var conan = undefined,
	    context = undefined,
	    stepDone = undefined,
	    awsResponseError = undefined,
	    aliasArn = undefined,
	    functionVersion = undefined,
	    responseData = undefined,
	    stepReturnError = undefined,
	    stepReturnData = undefined,
	    parameters = undefined;

	var mockLambda = {
		createAlias: _sinon2.default.spy(function (params, callback) {
			callback(awsResponseError, responseData(params));
		})
	};

	var MockAWS = {
		Lambda: _sinon2.default.spy(function () {
			return mockLambda;
		})
	};

	beforeEach(function () {
		conan = new _conan2.default({
			region: "us-east-1"
		});

		parameters = new (function () {
			function MockConanAwsLambda() {
				_classCallCheck(this, MockConanAwsLambda);
			}

			_createClass(MockConanAwsLambda, [{
				key: "name",
				value: function name() {
					return "TestFunction";
				}
			}, {
				key: "alias",
				value: function alias() {
					return [["development"], ["production", "1"]];
				}
			}]);

			return MockConanAwsLambda;
		}())();

		aliasArn = "arn:aws:lambda:aws-regions:accct-id:function:example:alias";
		functionVersion = "version";

		context = {
			parameters: parameters,
			libraries: { AWS: MockAWS },
			results: {}
		};

		awsResponseError = null;

		responseData = _sinon2.default.stub();
		responseData.returns({ AliasArn: aliasArn, FunctionVersion: functionVersion });
	});

	describe("(When calling AWS)", function () {
		beforeEach(function (done) {
			stepDone = function stepDone(afterStepCallback) {
				return function (error, data) {
					stepReturnError = error;
					stepReturnData = data;
					afterStepCallback();
				};
			};

			(0, _createLambdaAliasStep2.default)(conan, context, stepDone(done));
		});

		it("should be a function", function () {
			(typeof _createLambdaAliasStep2.default === "undefined" ? "undefined" : _typeof(_createLambdaAliasStep2.default)).should.equal("function");
		});

		it("should set the designated region on the lambda client", function () {
			MockAWS.Lambda.calledWith({
				region: conan.config.region
			}).should.be.true;
		});

		it("should call AWS with the designated function name parameter", function () {
			mockLambda.createAlias.calledWith({
				"FunctionName": context.parameters.name(),
				"FunctionVersion": "$LATEST",
				"Description": "conan auto created alias",
				"Name": "development"
			}).should.be.true;
		});

		describe("(Alias Create Request for Every Alias)", function () {
			beforeEach(function (done) {
				parameters = new (function () {
					function MockConanAwsLambda() {
						_classCallCheck(this, MockConanAwsLambda);
					}

					_createClass(MockConanAwsLambda, [{
						key: "name",
						value: function name() {
							return "TestFunction";
						}
					}, {
						key: "alias",
						value: function alias() {
							return [["development-all"], ["production-all", "1"]];
						}
					}]);

					return MockConanAwsLambda;
				}())();

				context = {
					parameters: parameters,
					libraries: { AWS: MockAWS },
					results: {}
				};
				(0, _createLambdaAliasStep2.default)(conan, context, stepDone(done));
			});

			it("should return the alias arn", function () {
				stepReturnData.should.eql({
					aliases: {
						"development-all": {
							aliasArn: aliasArn,
							functionVersion: functionVersion
						},
						"production-all": {
							aliasArn: aliasArn,
							functionVersion: functionVersion
						}
					}
				});
			});
		});

		describe("(Alias Create Request for Some Alias)", function () {
			beforeEach(function (done) {
				parameters = new (function () {
					function MockConanAwsLambda() {
						_classCallCheck(this, MockConanAwsLambda);
					}

					_createClass(MockConanAwsLambda, [{
						key: "name",
						value: function name() {
							return "TestFunction";
						}
					}, {
						key: "alias",
						value: function alias() {
							return [["development-some"], ["production-some", "2"], ["staging-some", "1"]];
						}
					}]);

					return MockConanAwsLambda;
				}())();

				context = {
					parameters: parameters,
					libraries: { AWS: MockAWS },
					results: {
						aliases: {
							"development-some": {
								aliasArn: aliasArn,
								functionVersion: "$LATEST"
							},
							"staging-some": {
								aliasArn: aliasArn
							}
						}
					}
				};
				(0, _createLambdaAliasStep2.default)(conan, context, stepDone(done));
			});

			it("should return the alias arn", function () {
				stepReturnData.should.eql({
					aliases: {
						"production-some": {
							aliasArn: aliasArn,
							functionVersion: functionVersion
						}
					}
				});
			});
		});

		describe("(Alias No Create Request made)", function () {
			beforeEach(function (done) {
				parameters = new (function () {
					function MockConanAwsLambda() {
						_classCallCheck(this, MockConanAwsLambda);
					}

					_createClass(MockConanAwsLambda, [{
						key: "alias",
						value: function alias() {
							return [["development"], ["production", "1"]];
						}
					}]);

					return MockConanAwsLambda;
				}())();

				context = {
					parameters: parameters,
					libraries: { AWS: MockAWS },
					results: {
						aliases: {
							"development": { aliasArn: aliasArn, functionVersion: functionVersion },
							"production": { aliasArn: aliasArn, functionVersion: functionVersion }
						}
					}
				};
				(0, _createLambdaAliasStep2.default)(conan, context, stepDone(done));
			});

			it("should return the alias arn", function () {
				stepReturnData.should.eql({ aliases: {} });
			});
		});

		describe("(Unknown Error is Returned)", function () {
			var errorMessage = undefined;

			beforeEach(function (done) {
				parameters = new (function () {
					function MockConanAwsLambda() {
						_classCallCheck(this, MockConanAwsLambda);
					}

					_createClass(MockConanAwsLambda, [{
						key: "name",
						value: function name() {
							return "TestFunction";
						}
					}, {
						key: "alias",
						value: function alias() {
							return [["development-some"], ["production-some", "1"]];
						}
					}]);

					return MockConanAwsLambda;
				}())();

				context = {
					parameters: parameters,
					libraries: { AWS: MockAWS },
					results: {
						aliases: {
							"development-some": { aliasArn: aliasArn, functionVersion: functionVersion }
						}
					}
				};
				errorMessage = "AWS returned status code 401";
				awsResponseError = { statusCode: 401, message: errorMessage };
				mockLambda.createAlias = _sinon2.default.spy(function (params, callback) {
					callback(awsResponseError, null);
				});
				(0, _createLambdaAliasStep2.default)(conan, context, stepDone(done));
			});

			it("should return an error which stops the step runner", function () {
				stepReturnError.message.should.eql(errorMessage);
			});
		});
	});
});