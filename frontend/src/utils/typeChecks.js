export const isValidScenario = (scenario) => {
  const requiredFields = [
    "_id",
    "title",
    "description",
    "category",
    "difficulty",
  ];

  // Debug logging
  console.log("Validating scenario:", scenario);

  if (!scenario || typeof scenario !== "object") {
    console.error("Scenario is not an object:", scenario);
    return false;
  }

  const missingFields = requiredFields.filter((field) => {
    const hasField = scenario.hasOwnProperty(field);
    if (!hasField) {
      console.error(`Missing required field: ${field}`);
    }
    return !hasField;
  });

  if (missingFields.length > 0) {
    console.error("Missing fields:", missingFields);
    return false;
  }

  return true;
};
