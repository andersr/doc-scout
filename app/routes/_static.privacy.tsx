import { PageTitle } from "~/components/layout/PageTitle";
import { PROSE_STYLES } from "~/styles/typography";
import PrivacyContent from "../static/Privacy.mdx";

export default function PrivacyPage() {
  return (
    <div>
      <PageTitle title="Privacy Policy" />
      <div className={PROSE_STYLES}>
        <PrivacyContent />
      </div>
    </div>
  );
}
