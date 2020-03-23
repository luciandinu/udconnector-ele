<?php
/*
Plugin Name: UD Connector for Elementor
Plugin URI: https://unremarkable.design
Description: Enable copy/paste functionality between UD and Elementor.
Version: 0.1.3
Author: Lucian Dinu
Author URI: 
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/


if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly



class UDesign_Connector_Elementor
{

  function __construct()
  {
    //Check if Elementor is installed 
    if ( ! did_action( 'elementor/loaded' ) ) {
			return;
    }

      //Register actions
    add_action('init', array($this, 'init'), 11);
    add_action('admin_head',  array($this, 'admin_head'));

    //Register Upload Images Ajax Handler
    add_action( 'wp_ajax_upload_images_to_wp', array($this,'upload_images_to_wp') );

    //Register frontend scripst
    add_action('elementor/editor/after_enqueue_scripts', function() {
      wp_enqueue_style('elementor-editor-udesign', plugin_dir_url(__FILE__) . 'assets/style.css');
      wp_enqueue_script('elementor-editor-udesign', plugin_dir_url(__FILE__) . 'assets/app.js', [], '1.0.1', true);
    });
  }

  function init()
  {
    //TBD
  }

  function admin_head()
  {
    //TBD
    echo '
    <style>

    </style>
    ';
  }

  /*
  Receive an array of urls
  Example:  ['https://url1', 'https://url2']
  Must return an array
  */
  //Upload external images to WP
  function upload_images_to_wp(){

    $img_array =  json_decode(stripslashes($_POST['images']));
    $new_images = array();


    foreach ($img_array as &$img_object) {
      $args = array(
        'post_type' => 'attachment',
        'post_mime_type' => 'image',
        'post_status' => 'inherit',
        'posts_per_page' => -1,
        'meta_query' => array(
          array(
            'key' => '_ud_original_url',
            'value' => $img_object->url,
            'compare' => 'LIKE'
          )
        )
      );
      $query = new WP_Query( $args );
      $rows = $query->get_posts();

      //If nothing found we upload the image
      if (count($rows) == 0){
        //Add image to media gallery and attach the origin meta
        $new_image_id = media_sideload_image($img_object->url, null, null, 'id');
        add_post_meta(  $new_image_id, '_ud_original_url', $img_object->url );
        //Add the info in the result json
        $img_object->new_id = $new_image_id;
        $img_object->new_url = wp_get_attachment_url( $new_image_id, 'original', false );
        $img_object->is_first_time = true;
      } else {
      // The Loop
        foreach ($rows as &$row_object) {
          // //Add the info in the result jscon
          $img_object->new_id = $row_object->ID;
          $img_object->new_url = $row_object->guid;
          $img_object->is_first_time = false;
        }
      }

    }

    echo json_encode($img_array);
    wp_die();
  }


  function get_attachment_id_from_src ($image_src) {
    global $wpdb;
    $query = "SELECT ID FROM {$wpdb->posts} WHERE guid='$image_src'";
    $id = $wpdb->get_var($query);
    return $id;
  }


}


new UDesign_Connector_Elementor();

