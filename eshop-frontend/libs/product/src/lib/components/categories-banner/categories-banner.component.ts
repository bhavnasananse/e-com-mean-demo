import { Component, OnInit } from '@angular/core';
import { Category } from '../../models/category';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'products-categories-banner',
  templateUrl: './categories-banner.component.html',
  styles: [
  ]
})
export class CategoriesBannerComponent implements OnInit {
  categories: Category[] = [];
  constructor(private categoryService: CategoriesService) { }

  ngOnInit(): void {
    this._getCategories();
  }
  private _getCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    })
  }
}
