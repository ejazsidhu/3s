import { CommonModule } from '@angular/common';
import { TooltipModule} from 'ngx-bootstrap';

import { AudioRecorderPlayComponent } from "./components";
import { HoldableDirective } from "./directives";
import { DisplayTime } from "./pipes";
import { FilestackService } from './services';

export const __IMPORTS = [CommonModule, TooltipModule];

export const __DECLARATIONS = [
  AudioRecorderPlayComponent,
  HoldableDirective,
  DisplayTime
];

export const __EXPORTS = [AudioRecorderPlayComponent];

export const __PROVIDERS = [FilestackService]