import { Component, OnInit, Input } from '@angular/core';
import { IntegrationService } from '../shared/integration.service';

@Component({
  selector: 'app-settings-integration-repo-item',
  templateUrl: './settings-integration-repo-item.component.html',
  styleUrls: ['./settings-integration-repo-item.component.sass']
})
export class SettingsIntegrationRepoItemComponent implements OnInit {
  @Input() repo: any;
  @Input() i: any;

  processing: boolean;

  constructor(public integration: IntegrationService) { }

  ngOnInit() { }

  import(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.processing = true;
    this.integration.importRepository(this.i.provider, this.repo, this.i.id)
      .subscribe(resp => {
        if (resp && resp.data) {
          this.repo.is_imported = true;
        }
      }, err => {
        console.error(err);
      }, () => {
        this.processing = false;
      });
  }
}