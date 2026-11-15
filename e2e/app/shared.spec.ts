// The shared, driver-neutral scenarios (e2e/scenarios) on the real Tauri app.
import basic from '../scenarios/basic';
import convert from '../scenarios/convert';
import formula from '../scenarios/formula';
import history from '../scenarios/history';
import i18n from '../scenarios/i18n';
import keyboard from '../scenarios/keyboard';
import { runGroup } from './run';

for (const group of [basic, keyboard, convert, formula, history, i18n]) runGroup(group);
