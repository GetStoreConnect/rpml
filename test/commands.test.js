import { expect } from 'chai';
import { addFinalCommands } from '../src/commands.js';

describe('addFinalCommands', () => {
  it('appends newline and cut commands to the end of the receipt', () => {
    const commands = [];
    const newCommands = addFinalCommands(commands);

    expect(commands.length).to.equal(0);
    expect(newCommands).to.deep.equal([
      { name: 'newline', value: 6 },
      { name: 'cut', value: 'partial' },
    ]);
  });

  it('removes final cut through document attribute', () => {
    const commands = [{ name: 'document', attributes: { cut: 'none' } }];
    const newCommands = addFinalCommands(commands);
    expect(newCommands).to.deep.equal([...commands, { name: 'newline', value: 6 }]);
  });

  it('customize final cut through document attribute', () => {
    const commands = [{ name: 'document', attributes: { cut: 'full' } }];
    const newCommands = addFinalCommands(commands);
    expect(newCommands).to.deep.equal([
      ...commands,
      { name: 'newline', value: 6 },
      { name: 'cut', value: 'full' },
    ]);
  });

  it('customize bottom margin through document attribute', () => {
    const commands = [{ name: 'document', attributes: { bottomMargin: 3 } }];
    const newCommands = addFinalCommands(commands);
    expect(newCommands).to.deep.equal([
      ...commands,
      { name: 'newline', value: 3 },
      { name: 'cut', value: 'partial' },
    ]);
  });
});
