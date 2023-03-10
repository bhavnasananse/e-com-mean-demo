import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService, Product, ProductsService } from '@eshop-frontend/product';
import { MessageService } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'admin-products-form',
  templateUrl: './products-form.component.html',
  styles: []
})
export class ProductsFormComponent implements OnInit, OnDestroy {
  editMode = false;
  form: FormGroup;
  isSubmitted = false;
  catagories = [];
  imageDisplay: string | ArrayBuffer;
  currentProductId: string;
  endSubs$: Subject<any> = new Subject();
  galleryImages = [];
  multipleImages = false;
  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._getCategories();
    this._checkEditMode();
  }

  ngOnDestroy() {
    this.endSubs$.next(0);
    this.endSubs$.complete();
  }

  private _initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      countInStock: ['', Validators.required],
      description: ['', Validators.required],
      richDescription: [''],
      image: ['', Validators.required],
      images: [],
      isFeatured: [false]
    });
  }

  private _getCategories() {
    this.categoriesService
      .getCategories()
      .pipe(takeUntil(this.endSubs$))
      .subscribe((categories) => {
        this.catagories = categories;
      });
  }

  private _addProduct(productData: FormData) {
    this.productsService
      .createProduct(productData)
      .pipe(takeUntil(this.endSubs$))
      .subscribe(
        (product: Product) => {
          if (product.id && this.multipleImages) {
            this.uploadMultipleImages(product.id);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Product ${product.name} is created!`
          });
          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Product is not created!'
          });
        }
      );
  }

  private _updateProduct(productFormData: FormData) {
    this.productsService
      .updateProduct(this.currentProductId, productFormData)
      .pipe(takeUntil(this.endSubs$))
      .subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product is updated!'
          });
          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Product is not updated!'
          });
        }
      );
  }

  private _checkEditMode() {
    this.route.params.pipe(takeUntil(this.endSubs$)).subscribe((params) => {
      if (params.id) {
        this.editMode = true;
        this.currentProductId = params.id;
        this.productsService
          .getProductById(params.id)
          .pipe(takeUntil(this.endSubs$))
          .subscribe((product) => {
            this.productForm.name.setValue(product.name);
            this.productForm.category.setValue(product.category['id']);
            this.productForm.brand.setValue(product.brand);
            this.productForm.price.setValue(product.price);
            this.productForm.countInStock.setValue(product.countInStock);
            this.productForm.isFeatured.setValue(product.isFeatured);
            this.productForm.description.setValue(product.description);
            this.productForm.richDescription.setValue(product.richDescription);
            this.imageDisplay = product.image;
            this.productForm.image.setValidators([]);
            this.productForm.image.updateValueAndValidity();
          });
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.invalid) return;
    const productFormData = new FormData();
    Object.keys(this.productForm).map((key) => {
      productFormData.append(key, this.productForm[key].value);
    });
    if (this.editMode) {
      this._updateProduct(productFormData);
    } else {
      this._addProduct(productFormData);
    }
  }
  onCancel() {
    this.location.back();
  }

  onImageUpload(event) {
    if (event.target.id === 'multiple-files') {
      this.galleryImages = event.target.files;
      this.form.patchValue({ images: this.galleryImages });
      this.form.get('images').updateValueAndValidity();
      this.multipleImages = true;
      if (this.editMode) {
        this.uploadMultipleImages(this.currentProductId);
      }
    } else {
      const file = event.target.files[0];
      if (file) {
        this.form.patchValue({ image: file });
        this.form.get('image').updateValueAndValidity();
        const fileReader = new FileReader();
        fileReader.onload = () => {
          this.imageDisplay = fileReader.result;
        };
        fileReader.readAsDataURL(file);
      }
    }
  }

  get productForm() {
    return this.form.controls;
  }
  uploadMultipleImages(productId) {
    const productFormData = new FormData();
    for (let i = 0; i < this.form.get('images').value.length; i++) {
      productFormData.append('images', this.form.get('images').value[i]);
    }
    this.productsService.uploadGalleryImages(productId, productFormData).subscribe(() => {
      console.log('uploadGalleryImages');
    });
  }
}
