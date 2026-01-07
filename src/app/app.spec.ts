import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home/home.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title in the home view', async () => {
    const fixture = TestBed.createComponent(App);
    const harness = await RouterTestingHarness.create();
    // Navigate to the root route to activate the HomeComponent
    await harness.navigateByUrl('/');
    const activated = harness.routeDebugElement?.componentInstance;
    expect(activated).toBeInstanceOf(HomeComponent);

    const compiled = harness.fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'The Power of Reading: Elevating Your Language Journey'
    );
  });
});
