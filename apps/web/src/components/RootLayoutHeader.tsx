import { UserName } from '@web/components/UserName';

export const RootLayoutHeader = () => {
  return (
    <div id="welcome">
      <h1>
        <UserName />
        Welcome web 👋
      </h1>
    </div>
  );
};
