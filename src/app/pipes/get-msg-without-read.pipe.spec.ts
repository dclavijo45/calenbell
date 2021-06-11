import { GetMsgWithoutReadPipe } from './get-msg-without-read.pipe';

describe('GetMsgWithoutReadPipe', () => {
  it('create an instance', () => {
    const pipe = new GetMsgWithoutReadPipe();
    expect(pipe).toBeTruthy();
  });
});
