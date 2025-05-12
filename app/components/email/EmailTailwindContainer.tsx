import { Tailwind } from "@react-email/tailwind";

export function EmailTailwindContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              beige: "#F7F5E3",
              black: "#000000",
              "dark-blue": "#193D5D",
              "dark-green": "#264728",
              "dark-red": "#B20009",
              grey: {
                1: "#F5F6F4",
                2: "#E0E3DE",
                3: "#8C9787",
                4: "#5A6255",
              },
              "light-blue": "#D1E4F8",
              "light-green": "#DBEBBC",
              "light-red": "#FFD3C2",
              "med-blue": "#2962D3",
              "med-green": "#2F7B51",
              orange: "#D66D0D",
              yellow: "#F3F498",
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
}
