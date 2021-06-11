import { ValidateUsernameConfigPipe } from './validate-username-config.pipe';

describe('ValidateUsernameConfigPipe', () => {
  it('create an instance', () => {
    const pipe = new ValidateUsernameConfigPipe();
    expect(pipe).toBeTruthy();
  });
});
