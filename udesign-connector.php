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
      wp_enqueue_script('elementor-editor-udesign', plugin_dir_url(__FILE__) . 'assets/app.js', [], '1.0.0', true);
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
    
    //Return something
    //echo json_encode($results);
    //$results = "GIGI";

    global $wpdb; //Global WPDB
    $vars = array();

    // $query = '';
    // $query .= "SELECT post_id ";
    // $query .= "FROM " . $wpdb->posts;
    

    foreach ($img_array as &$img_object) {
      //Upload if necessary 
      //media_sideload_image()
    }

    echo json_encode($img_array);
    wp_die();
  }


}


new UDesign_Connector_Elementor();

