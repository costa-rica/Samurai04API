function checkBodyReturnMissing(body: any, keys: any) {
	let isValid = true;
	let missingKeys = [];

	for (const field of keys) {
		if (!body[field] || body[field] === "") {
			isValid = false;
			missingKeys.push(field);
		}
	}

	return { isValid, missingKeys };
}

export { checkBodyReturnMissing };
