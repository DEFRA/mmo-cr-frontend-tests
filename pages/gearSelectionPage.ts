import { type Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class GearSelectionPage extends BasePage {
  public readonly pageHeading = (): Locator => this.page.getByRole('heading', { name: 'What gear did you use?' });

  public readonly gearCheckbox = (gearName: string): Locator =>
    this.page.getByRole('checkbox', { name: gearName, exact: true });

  public readonly gearInputs = {
    bottomOtterTrawl: {
      numberOfTrawlNets: (): Locator => this.page.locator('#bottom-otter-trawl-numberOfTrawlNets'),
      meshSize: (): Locator => this.page.locator('#bottom-otter-trawl-meshSize')
    },
    dredge: {
      numberOfDredges: (): Locator => this.page.locator('#dredge-numberOfDredges'),
      numberOfTimesShot: (): Locator => this.page.locator('#dredge-numberOfTimesShot')
    },
    handlines: {
      rodsAndLines: (): Locator => this.page.locator('#handlines-pole-lines-rodsAndLines')
    },
    pots: {
      hauled: (): Locator => this.page.locator('#potsHauled'),
      inWater: (): Locator => this.page.locator('#potsInWater')
    },
    seineNets: {
      meshSize: (): Locator => this.page.locator('#seine-nets-meshSize')
    },
    traps: {
      hauled: (): Locator => this.page.locator('#traps-totalHauled'),
      inWater: (): Locator => this.page.locator('#traps-totalInWater')
    }
  };

  public readonly addGearLink = (): Locator => this.page.getByRole('link', { name: 'Add gear' });

  public readonly removeGearLink = (): Locator => this.page.getByRole('link', { name: 'Remove gear' });

  async selectGear(gearName: string) {
    await this.gearCheckbox(gearName).click();
  }

  async enterBottomOtterTrawlDetails(nets: string, mesh: string) {
    await this.gearInputs.bottomOtterTrawl.numberOfTrawlNets().fill(nets);
    await this.gearInputs.bottomOtterTrawl.meshSize().fill(mesh);
  }

  async enterDredgeDetails(dredges: string, timesShot: string) {
    await this.gearInputs.dredge.numberOfDredges().fill(dredges);
    await this.gearInputs.dredge.numberOfTimesShot().fill(timesShot);
  }

  async enterHandlinesDetails(rods: string) {
    await this.gearInputs.handlines.rodsAndLines().fill(rods);
  }

  async enterPotsDetails(hauled: string, inWater: string) {
    await this.gearInputs.pots.hauled().fill(hauled);
    await this.gearInputs.pots.inWater().fill(inWater);
  }

  async enterSeineNetsDetails(mesh: string) {
    await this.gearInputs.seineNets.meshSize().fill(mesh);
  }

  async enterTrapsDetails(hauled: string, inWater: string) {
    await this.gearInputs.traps.hauled().fill(hauled);
    await this.gearInputs.traps.inWater().fill(inWater);
  }
}
