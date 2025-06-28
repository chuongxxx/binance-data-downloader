export const mutationFetcher = async (
  url: string,
  { arg }: { arg: string }
) => {
  console.log(arg);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("POST failed");
  }
  const data = await response.json();
  return data;
};
