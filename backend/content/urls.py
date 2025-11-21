from django.urls import path
from . import views

urlpatterns = [
    path('homepage/', views.homepage, name='homepage'),
    path('site-config/', views.site_config, name='site_config'),
    path('footer-address/', views.get_footer_address, name='footer_address'),
    path('main-pages/', views.main_pages, name='main_pages'),
    path('menu/footer/', views.menu_footer, name='menu_footer'),
    path('categories/', views.categories_for_page, name='categories_for_page'),
    path('categories/all/', views.categories_api, name='categories_api'),
    path('blogs/', views.blogs_list, name='blogs_list'),
    path('blogs/<slug:slug>/', views.blog_detail, name='blog_detail'),
    path('pages-with-categories/', views.pages_with_categories, name='pages_with_categories'),
    path('contact/submit/', views.contact_submit, name='contact_submit'),
    path('quotes/', views.quotes, name='quotes'),
    path('page/<slug:slug>/', views.page_detail, name='page_detail'),
]
