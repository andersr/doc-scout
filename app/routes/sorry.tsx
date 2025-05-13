export function meta() {
  return [{ title: "Sorry" }];
}

export default function SorryRoute() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div>
        Sorry, something went wrong. This could be due to a bad request or
        insufficient permissions. Please contact the site owner for more
        details.
      </div>
    </div>
  );
}
