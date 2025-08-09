export const avoidSpacesOnInput = (e: any) => {
  if (e.code === "Space") e.preventDefault();
};
