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

}


new UDesign_Connector_Elementor();

