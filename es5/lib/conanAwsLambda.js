"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _conan = require("conan");

var _findLambdaByName = require("./steps/findLambdaByName.js");

var _findLambdaByName2 = _interopRequireDefault(_findLambdaByName);

var _findRoleByName = require("./steps/findRoleByName.js");

var _findRoleByName2 = _interopRequireDefault(_findRoleByName);

var _createRole = require("./steps/createRole.js");

var _createRole2 = _interopRequireDefault(_createRole);

var _attachRolePolicy = require("./steps/attachRolePolicy.js");

var _attachRolePolicy2 = _interopRequireDefault(_attachRolePolicy);

var _buildPackages = require("./steps/buildPackages.js");

var _buildPackages2 = _interopRequireDefault(_buildPackages);

var _compileLambdaZip = require("./steps/compileLambdaZip.js");

var _compileLambdaZip2 = _interopRequireDefault(_compileLambdaZip);

var _upsertLambda = require("./steps/upsertLambda.js");

var _upsertLambda2 = _interopRequireDefault(_upsertLambda);

var _findLambdaAliases = require("./steps/findLambdaAliases.js");

var _findLambdaAliases2 = _interopRequireDefault(_findLambdaAliases);

var _upsertLambdaAliases = require("./steps/upsertLambdaAliases.js");

var _upsertLambdaAliases2 = _interopRequireDefault(_upsertLambdaAliases);

var _validateLambda = require("./steps/validateLambda.js");

var _validateLambda2 = _interopRequireDefault(_validateLambda);

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _dependency = require("./dependency.js");

var _dependency2 = _interopRequireDefault(_dependency);

var _alias = require("./alias.js");

var _alias2 = _interopRequireDefault(_alias);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConanAwsLambda = function (_ConanComponent) {
	_inherits(ConanAwsLambda, _ConanComponent);

	function ConanAwsLambda() {
		_classCallCheck(this, ConanAwsLambda);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(ConanAwsLambda).apply(this, arguments));
	}

	_createClass(ConanAwsLambda, [{
		key: "initialize",
		value: function initialize(conan, name) {
			this.properties("name", "file", "runtime", "role", "description", "memorySize", "timeout", "publish", "bucket", "packages", "packagesDirectory", "roleArn", "arn", "iamClient", "lambdaClient", "version", "bucket", "handler", "zipPath");

			this.properties("region", "profile").then(this.updateClients);

			/**
    * DEFAULT VALUES
    */
			this.name(name || null);
			this.handler("handler");
			this.runtime("nodejs");
			this.memorySize(128);
			this.timeout(3);
			this.region(conan.region());
			this.publish(true);
			this.iamClient(conan.iamClient());
			this.lambdaClient(conan.lambdaClient());
			this.profile(conan.profile());
			this.role(conan.role());
			this.bucket(conan.bucket());
			this.handler(conan.handler());

			this.component("dependency", _dependency2.default).into("dependencies");
			this.component("alias", _alias2.default).into("aliases");

			conan.series(_validateLambda2.default, _findLambdaByName2.default, _findRoleByName2.default, _createRole2.default, _attachRolePolicy2.default, _buildPackages2.default, _compileLambdaZip2.default, _upsertLambda2.default, _findLambdaAliases2.default, _upsertLambdaAliases2.default).apply(this);

			(0, _incognito2.default)(this).conan = conan;
		}
	}, {
		key: "invoke",
		value: function invoke(payload, callback) {
			var parameters = {
				FunctionName: this.name(),
				Payload: JSON.stringify(payload),
				InvocationType: "RequestResponse",
				LogType: "None"
			};

			this.lambdaClient().invoke(parameters, function (error, data) {
				if (error) {
					callback(error);
				} else {
					callback(null, {
						StatusCode: data.StatusCode,
						Payload: JSON.parse(data.Payload)
					});
				}
			});
		}
	}, {
		key: "updateClients",
		value: function updateClients() {
			// TODO: Add coverage for the AWS.Lambda config here.
			// Currently not possible without lots of extra work.
			// See: https://github.com/dwyl/aws-sdk-mock/issues/38

			var awsConfig = { region: this.region(), profile: this.profile() };

			this.lambdaClient(new _awsSdk2.default.Lambda(awsConfig));
			this.iamClient(new _awsSdk2.default.IAM(awsConfig));
		}
	}]);

	return ConanAwsLambda;
}(_conan.ConanComponent);

exports.default = ConanAwsLambda;