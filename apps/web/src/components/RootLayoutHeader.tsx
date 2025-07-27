import Test from '@web/components/test';
import { UserName } from '@web/components/UserName';

export const RootLayoutHeader = () => {
  return (
    <div id="welcome">
      <h1>
        <Test />
        <UserName />
        Welcome web 👋
      </h1>
    </div>
  );
};
