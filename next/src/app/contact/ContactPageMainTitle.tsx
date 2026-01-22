import BaseContainer from "@/components/BaseContainer";
import PageMainTitle from "@/components/PageMainTitle";

const ContactPageMainTitle = async () => {
  return (
    <BaseContainer>
      <PageMainTitle
        japanseTitle="お問い合わせ"
        englishTitle="Inquiry"
      ></PageMainTitle>
    </BaseContainer>
  );
};

export default ContactPageMainTitle;