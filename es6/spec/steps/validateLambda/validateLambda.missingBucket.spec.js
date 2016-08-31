import validateLambda from "../../../lib/steps/validateLambda.js";

describe(".validateLambda(conan, lambda, stepDone) (When lambda has packages set, but conan missing a bucket)", () => {
	let conan,
			lambda,
			returnedError;

	beforeEach(done => {
		conan = { config: {} };
		lambda = {
			role: () => { return "MyIamRoleName"; },
			packages: () => { return { async: "1.0.0"	}; }
		};

		validateLambda(conan, lambda, error => {
			returnedError = error;
			done();
		});
	});

	it("should return an error", () => {
		returnedError.message.should.be.eql("conan.config.bucket is required to use .packages().");
	});
});