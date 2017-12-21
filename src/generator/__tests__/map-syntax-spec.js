import mapSyntax from "../map-syntax";

test("map syntax throws if Type is unknown", () => {
  expect(() => {
    mapSyntax({}, { value: "unknown", Type: null });
  }).toThrow();
});
