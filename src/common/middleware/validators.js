export const Validation = (schema) => {
    return (req, res, next) => {
        if (!schema) {
            return next();
        }

        let errorMessage = [];

        for (const key of Object.keys(schema)) {
            if (req[key] && schema[key]) {
                const { error } = schema[key].validate(req[key], { abortEarly: false });
                
                if (error) {
                    error.details.forEach(element => {
                        errorMessage.push({
                            key,
                            path: element.path,
                            message: element.message
                        });
                    });
                }
            }
        }

        if (errorMessage.length > 0) {
            return res.status(400).json({ message: "validation error", error: errorMessage });
        }

        next();
    };
};