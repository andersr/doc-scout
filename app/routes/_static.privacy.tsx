import { PROSE_STYLES } from "~/styles/typography";
import type { RouteData } from "~/types/routes";
import PrivacyContent from "../static/Privacy.mdx";

export const handle: RouteData = {
  addBackButton: true,
  pageTitle: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className={PROSE_STYLES}>
      <PrivacyContent />
    </div>
  );
}
