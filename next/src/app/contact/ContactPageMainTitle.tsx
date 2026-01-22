import BaseContainer from "@/components/BaseContainer";
import PageMainTitle from "@/components/PageMainTitle";
import { auth } from "@/lib/auth";
const ContactPageMainTitle = async () => {
  const session = await auth();
  const isRegister = session ? "Register" : "";

  return (
    <BaseContainer>
      <PageMainTitle
        japanseTitle={isRegister ? "問い合わせ管理" : "お問い合わせ"}
        englishTitle={isRegister ? "Inquiry Management" : "Inquiry"}
      ></PageMainTitle>
    </BaseContainer>
  );
};

export default ContactPageMainTitle;