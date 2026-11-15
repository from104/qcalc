// App-only scenarios: Tauri commands, native window, process, profile, system clipboard, AT-SPI.
import native from './native';
import { runGroup } from './run';

runGroup(native);
